import { DEFAULT_COMPACTION_SETTINGS, estimateTokens } from '@earendil-works/pi-agent-core'
import { AGENT_MODEL_CONTEXT_WINDOW, type AgentMessage } from '@xmcl/runtime-api'
import type { Message } from '@earendil-works/pi-ai'
import type { Context as ProviderContext } from '@earendil-works/pi-ai'
import { AGENT_COMPACTION_MESSAGE_NAME, toPiMessage } from './protocol'

export interface AgentCompactionPreparation {
  messagesToSummarize: AgentMessage[]
  retainedMessages: AgentMessage[]
  tokensBefore: number
}

export const AGENT_COMPACTION_SYSTEM_PROMPT = 'You summarize conversation context for another agent. Do not continue the conversation or answer its questions. Return only a concise checkpoint summary.'

/** Bound local prompts without claiming omitted evidence was inspected. History stays intact. */
export function boundAgentProviderContext(context: ProviderContext, contextWindow: number, maxOutput: number): ProviderContext {
  const messages = context.messages.map(message => message.role === 'toolResult' ? {
    ...message,
    content: message.content.map(part => part.type === 'text' && part.text.length > contextWindow
      ? { ...part, text: part.text.slice(0, contextWindow) + '\n[Tool output truncated. Request a smaller range with the appropriate read tool.]' }
      : part),
  } : message)
  const budget = Math.max(128, contextWindow - maxOutput)
  const estimate = () => Math.ceil(JSON.stringify({ ...context, messages }).length / 4)
  let omitted = false
  while (estimate() > budget) {
    const nextUser = messages.findIndex((message, index) => index > 0 && message.role === 'user')
    if (nextUser < 0) throw new Error('pbtadmin.contextTooSmall')
    messages.splice(0, nextUser)
    omitted = true
  }
  return { ...context, messages, systemPrompt: (context.systemPrompt || '') + (omitted ? '\n[Older conversation turns are outside this model context. Do not invent their content; ask the user for any missing information.]' : '') }
}

function messageTokens(message: AgentMessage, provider: string, model: string) {
  const converted = toPiMessage(message, provider, model)
  return converted ? estimateTokens(converted) : 0
}

export function estimateAgentContextTokens(
  messages: AgentMessage[],
  systemPrompt: string,
  pendingInput: string,
  provider: string,
  model: string,
) {
  const lastUsageIndex = messages.findLastIndex(message => message.role === 'assistant' && !!message.contextTokens)
  if (lastUsageIndex >= 0) {
    return messages[lastUsageIndex].contextTokens!
      + Math.ceil(pendingInput.length / 4)
      + messages.slice(lastUsageIndex + 1).reduce((total, message) => total + messageTokens(message, provider, model), 0)
  }
  return Math.ceil((systemPrompt.length + pendingInput.length) / 4)
    + messages.reduce((total, message) => total + messageTokens(message, provider, model), 0)
}

export function prepareAgentCompaction(
  messages: AgentMessage[],
  contextTokens: number,
  provider: string,
  model: string,
  contextWindow = AGENT_MODEL_CONTEXT_WINDOW,
): AgentCompactionPreparation | undefined {
  if (contextTokens <= contextWindow) return undefined

  let retainedTokens = 0
  let retainedStart = 0
  for (let index = messages.length - 1; index >= 0; index--) {
    retainedTokens += messageTokens(messages[index], provider, model)
    if (retainedTokens >= Math.min(DEFAULT_COMPACTION_SETTINGS.keepRecentTokens, Math.floor(contextWindow / 4))) {
      retainedStart = index
      break
    }
  }

  while (retainedStart > 0 && messages[retainedStart]?.role !== 'user') retainedStart--
  if (retainedStart <= 0) return undefined

  return {
    messagesToSummarize: messages.slice(0, retainedStart),
    retainedMessages: messages.slice(retainedStart),
    tokensBefore: contextTokens,
  }
}

export function createAgentCompactionMessage(summary: string, tokensBefore: number): AgentMessage {
  return {
    role: 'system',
    name: AGENT_COMPACTION_MESSAGE_NAME,
    content: summary,
    compaction: { tokensBefore },
  }
}

export function compactedMessages(preparation: AgentCompactionPreparation, summary: string) {
  return [
    createAgentCompactionMessage(summary, preparation.tokensBefore),
    ...preparation.retainedMessages.map(message => message.role === 'assistant'
      ? { ...message, contextTokens: undefined }
      : message),
  ]
}

export function toCompactionInput(messages: AgentMessage[], provider: string, model: string): Message[] {
  return messages
    .map(message => toPiMessage(message, provider, model))
    .filter((message): message is Message => !!message)
}

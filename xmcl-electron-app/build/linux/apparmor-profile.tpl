abi <abi/4.0>,
include <tunables/global>

profile "${executable}" "/opt/PbtModLauncherX/${executable}" flags=(unconfined) {
  userns,

  include if exists <local/${executable}>
}

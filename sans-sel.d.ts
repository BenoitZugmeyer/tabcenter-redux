declare module "sans-sel" {
  type Style = string | SansSel | void | false
  interface SansSel {
    (...styles: Style[]): string,
    namespace(name: string): SansSel
    addRules(rules: object): SansSel
  }

  export default function sansSel(): SansSel
}

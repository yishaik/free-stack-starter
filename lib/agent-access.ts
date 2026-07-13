import type { Service } from './services'

export type AgentAccessService = Pick<Service, 'name' | 'docs' | 'signup'>

export function buildAgentAccessPrompt(service: AgentAccessService) {
  return `Configure agent access to ${service.name} using provider-maintained tooling only.

Official documentation: ${service.docs}
Account or setup page: ${service.signup}

Tasks:
1. Check the official documentation and the provider's verified source repositories for an official MCP server.
2. If an official MCP server exists, install it and configure it for the current agent runtime.
3. Otherwise, install the official ${service.name} CLI using the provider's documented installation method.
4. If the provider publishes neither an official MCP server nor an official CLI, use its official SDK or API and clearly state that no official MCP/CLI is available.
5. Authenticate with the least-privileged scopes required for read-only access first. Prefer OAuth or device login when supported.
6. Keep credentials out of chat, source control, shell history, and generated files. Store them in the platform secret store or an ignored local environment file.
7. Run a harmless read-only verification command or API request.
8. Report:
   - the official package, binary, or repository installed
   - the configuration file and environment variables added
   - the permissions or scopes granted
   - the exact verification command and its result

Do not install community MCP servers, unofficial CLIs, or similarly named packages without explicit approval.`
}

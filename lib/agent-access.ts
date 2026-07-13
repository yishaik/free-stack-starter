import type { Service } from './services'

export type AgentAccessService = Pick<Service, 'name' | 'docs' | 'signup' | 'category' | 'audiences' | 'tags' | 'plan'>

export function buildAgentAccessPrompt(service: AgentAccessService) {
  return `Configure agent access to ${service.name} using provider-maintained tooling only.

Service context:
- Category: ${service.category}
- Intended audiences: ${service.audiences.join(', ')}
- Free model: ${service.plan}
- Capabilities: ${service.tags.slice(0, 10).join(', ')}
- Official documentation: ${service.docs}
- Account or setup page: ${service.signup}

Tasks:
1. Read the official documentation and identify the provider's verified organization, package namespace, binary, repository, and current installation instructions.
2. Check whether the provider maintains an official MCP server. If it does, install and configure that MCP server for the current agent runtime.
3. If no official MCP server exists, install the official ${service.name} CLI using the provider's documented method. Prefer a project-scoped installation when supported; explain before installing globally or modifying system packages.
4. If the provider publishes neither an official MCP server nor an official CLI, use its official SDK or API and clearly state that no official MCP/CLI is available.
5. Verify package ownership and release provenance before installation. Do not use similarly named packages, third-party MCP servers, forks, install scripts, or binaries unless I explicitly approve them.
6. Authenticate with the least-privileged scopes required for read-only access first. Prefer OAuth, device login, short-lived credentials, or a platform secret store when supported.
7. Keep credentials out of chat, source control, shell history, logs, screenshots, and generated files. Never print or echo a secret.
8. Run a harmless read-only identity, account, list, version, or status command to verify the connection. Do not create, modify, deploy, delete, purchase, invite, or publish anything during verification.
9. Report:
   - the official package, binary, repository, publisher, and installed version
   - the exact installation and configuration commands used
   - the configuration files and environment-variable names added (never secret values)
   - the permissions or scopes granted
   - the verification command and sanitized result
   - any remaining manual action or security caveat

Stop and ask for approval if official ownership is unclear, installation requires elevated privileges, or the requested read-only connection cannot be achieved safely.`
}

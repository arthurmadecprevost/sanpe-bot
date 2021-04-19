const commandMemory = {}

export function registerCommands(...commandsAndAliases) {
  const commands = new Map()
  for (const { aliases = [], resolver = () => {} } of commandsAndAliases) {
    if (aliases == null || !Array.isArray(aliases)) {
      throw new Error(`Command must have a name`) // If no aliases, there is no name
    }

    for (const alias of aliases) {
      if (commands.has(alias)) {
        throw new Error(`Alias or command "${alias}" already declared.`)
      }

      commands.set(alias, resolver)
    }
  }

  return (incomingMessage, messageContext) => {
    if (!incomingMessage.text.startsWith('!')) {
      return { ...messageContext } // Ignore if not a command
    }

    const args = incomingMessage.text.trim().slice(1).split(' ')
    const commandName = args.shift().toLowerCase()

    if (!commands.has(commandName)) {
      return {
        ...messageContext,
        message: `This command doesn't exist or you can't type. Respect me please!`,
      }
    }

    return {
      ...messageContext,
      message: commands.get(commandName)({
        ...messageContext,
        command: {
          name: commandName,
          args,
          message: args.join(' '),
          memory: commandMemory,
        },
      }),
    }
  }
}

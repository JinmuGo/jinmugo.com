type Environment = Record<string, string | undefined>

export function requiredEnv(name: string, source: Environment = process.env) {
  const value = source[name]
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function minimumLengthEnv(
  name: string,
  minimumLength: number,
  source: Environment = process.env,
) {
  const value = requiredEnv(name, source)
  if (value.trim().length < minimumLength) {
    throw new Error(`${name} must be at least ${minimumLength} characters`)
  }
  return value
}

export function commaSeparatedEnv(name: string, source: Environment = process.env) {
  const values = requiredEnv(name, source)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  if (values.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return values
}

export function serverPort(source: Environment = process.env) {
  const port = Number(source.PORT ?? 3001)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${source.PORT}`)
  }
  return port
}

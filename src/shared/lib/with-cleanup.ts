export const withCleanup = async (task: () => Promise<void>, cleanup: () => void | Promise<void>) => {
  try {
    await task()
  } finally {
    await cleanup()
  }
}

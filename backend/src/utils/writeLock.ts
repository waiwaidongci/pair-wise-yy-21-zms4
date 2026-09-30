/**
 * 进程内串行写锁。Node 单线程，但 await（注入的写失败、后续接真实 DB）
 * 会让出事件循环，两位调度员的派工请求可能交错执行；
 * 所有派工台写操作都在 runExclusive 内完成“校验+落库”，
 * 从而让乐观锁比较与三实体写入成为不可分割的临界区。
 */
let writeChain: Promise<unknown> = Promise.resolve();

export const runExclusive = async <T>(task: () => Promise<T> | T): Promise<T> => {
  const run = writeChain.then(() => task());
  // 无论任务成败都释放锁：用 catch 把拒绝延后到调用方。
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
};

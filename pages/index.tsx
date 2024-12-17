/** Add your relevant code here for the issue to reproduce */
export default function Home() {
  const createDb = () => {
    const worker = new Worker(
      new URL('../public/assets/worker.sql-wasm.js', import.meta.url)
    );
    worker.onerror = (e) => console.log('Worker error: ', e);
  };
  return (
    <>
      <h1>Test</h1>
      <br />
      <button
        onClick={() => {
          createDb();
        }}
      >
        Create DB
      </button>
    </>
  );
}

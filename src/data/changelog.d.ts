declare module '*.json' {
  interface ChangelogEntry {
    date: string;
    changes: string[];
  }
  const value: ChangelogEntry[];
  export default value;
}

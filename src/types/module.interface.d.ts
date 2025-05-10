export interface module {
    category: string,
    description: string,
    enabled: boolean,
    id: string,
    name: string,
    pap: 'green' | 'red',
    regexPatterns: string[],
    urls: string[]
}
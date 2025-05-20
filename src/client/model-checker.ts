export type Model = { [key: string]: any };

export function validateObject<T extends Model>(model: T, input: any): T {
    const result: any = {};

    for (const key in model) {
        const defaultValue = model[key];
        const inputValue = input?.[key];

        const isValidType = typeof inputValue === typeof defaultValue;

        result[key] = isValidType ? inputValue : defaultValue;
    }

    return result;
}

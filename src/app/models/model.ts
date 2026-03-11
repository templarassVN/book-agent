export interface IMessageResponse<T> {
    type: string,
    value: T
}

export interface IRecommendation {
    name: string,
    link: string,
    gerne: string
}

export const IRecommendationSource = `
{
    name: string,
    link: string,
    gerne: string
}`;


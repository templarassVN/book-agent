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

export interface IQuestion {
    question: string,
    answers: string[]
}

export const IQuestionSource = `
{
    question: string,
    answers: string[]
}`;

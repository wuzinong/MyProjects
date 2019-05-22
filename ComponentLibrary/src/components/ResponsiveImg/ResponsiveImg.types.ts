export interface IResponsiveImgProps {
    imgArr:IImgArr[];
    defaultUrl:string;
    alt?:string;
    title?:string;
    cName?:string;
}

export interface IImgArr{
    imgUrl: string;
    imgQuery:string;
    mediaQuery:string;
    imgType?:string;
}
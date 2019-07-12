

export interface ICancelObject{
    cancel?: boolean; 
    tag?: string
}

export const enum tagtypes{
    homeServicesList = 'homeserives'
}

class AjaxHelper {

    private _requestList:object;

    constructor() {
        this._requestList = {};
    }

    static toProductDetails(response: any) {
        return {
            name: response.name,
            maturity: response.maturity,
            tagline: response.dynamic ? response.dynamic.tagline : null,
            mainImage: response.dynamic ? response.dynamic.mainImage : null,
            features: response.dynamic ? response.dynamic.features : null,
            sections: response.dynamic ? response.dynamic.sections : null,
            testimonials: response.dynamic ? response.dynamic.testimonials : null,
            isProviderFullWidth: response.dynamic ? response.dynamic.isProviderFullWidth : null,
            additionalInfo: response.dynamic ? response.dynamic.additionalInfo : null,
            provider: response.provider,
            termsOfUse: response.dynamic ? response.dynamic.termsOfUse : null,
            productVariants: response.dynamic ? response.dynamic.productVariants : null,
            variantsRelationship: response.dynamic ? response.dynamic.variantsRelationship : null,
            categorization: response.dynamic ? response.dynamic.categorization : null,
            purchaseOptions: response.purchaseOptions,
            interactions: response.dynamic ? response.dynamic.interactions : null,
            video:response.dynamic ? response.dynamic.video : null
        };
    }

    static toProduct(response: any) {
        return {
            name: response.name,
            urls: response.urls,
            maturity: response.maturity,
            summary: response.dynamic ? response.dynamic.summary : null,
            mainImageUrl: response.dynamic ? response.dynamic.mainImageUrl : null,
            categorization: response.dynamic ? response.dynamic.categorization : null,
            termsOfUse: response.dynamic ? response.dynamic.termsOfUse : null,
            provider: response.provider
        };
    }

    fetchProductDetails = async (slug: string): Promise<any> => {
        return this.makeRequest<any>('GET', '/products', AjaxHelper.toProductDetails);
    }

    fetchSearchProducts = async (searchTerm: string, filter: { [key: string]: string[] }): Promise<any> => {
        if (searchTerm == '') return [];
        else return this.makeRequest<any>('GET', '/search', (response) => response.map(AjaxHelper.toProduct));
    }

    fetchFilteredProducts = async (filter: { [key: string]: string[] }) => {
        return this.makeRequest<any>('GET', '/filter', (response) => response.map(AjaxHelper.toProduct),{cancel:true,tag:tagtypes.homeServicesList});
    }


    private makeRequest<T>(method, url, map: (data: any) => T,{cancel=false,tag=''}:ICancelObject={}): Promise<T> {
        return new Promise(
            (resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const parsedResponse = JSON.parse(xhr.response);
                        resolve(map(parsedResponse));
                    } else {
                        reject({
                            status: xhr.status,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onerror = () => {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                };
                if(cancel == true){
                    this.cancelRequest(tag);
                    this.queueRequest(tag,xhr);
                }
                xhr.send();
            }
        );
    }
}

export default AjaxHelper;
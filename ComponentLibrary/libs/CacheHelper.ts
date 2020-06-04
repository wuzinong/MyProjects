
export const CacheKeys = {
    CountryList:'CountryList',
    DeclineMessages:'DeclineMessages'
}
 

class CacheHelper {
    /** Load data about a successful purchase from session storage. */
    static getSessionStorage(key: string): any {
      return JSON.parse(sessionStorage.getItem(key));
    }
  
    /** Save data about a successful purchase to session storage. */
    static setSessionStorage(key: string, value: any) {
      sessionStorage.setItem(key, JSON.stringify(value))
    }

    static getLocalStorage(key: string): any {
        return JSON.parse(localStorage.getItem(key));
      }
    static setLocalStorage(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value))
      }
  }

  
export default CacheHelper;
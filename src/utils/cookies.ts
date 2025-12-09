export const getCookie = ( name: string ): string | null => {
    if ( typeof document === 'undefined' ) return null;

    const value = `; ${ document.cookie }`;
    const parts = value.split( `; ${ name }=` );
    if ( parts.length === 2 ) return parts.pop()?.split( ';' ).shift() || null;
    return null;
};

export const getUserRole = (): string | null => {
    return getCookie( 'userRole' );
};

export const getCompanyId = (): string | null => {
    return getCookie( 'companyId' );
};

export const isAdmin = (): boolean => {
    return getUserRole() === 'admin';
};

export const canAccessCompany = ( companyId: number | string ): boolean => {
    const userRole = getUserRole();
    const userCompanyId = getCompanyId();

    if ( userRole === 'admin' ) return true;
    return userCompanyId ? userCompanyId === companyId.toString() : false;
};
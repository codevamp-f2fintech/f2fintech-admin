export const StorageHelper = {
    // Get user data from localStorage
    getUserData: () => {
        return {
            userId: localStorage.getItem('userId'),
            companyId: localStorage.getItem('companyId'),
            companyName: localStorage.getItem('companyName'),
            userRole: localStorage.getItem('userRole'),
        };
    },

    // Clear user data on logout
    clearUserData: () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('companyId');
        localStorage.removeItem('selectedCompanyId');
        localStorage.removeItem('companyName');
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('userId');
        // return !!localStorage.getItem( 'userId' ) && !!localStorage.getItem( 'companyId' );
    }
};
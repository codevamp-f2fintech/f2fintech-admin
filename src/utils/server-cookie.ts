import { cookies } from "next/headers";

export const getServerCookies = (): Record<string, string> => {
    const cookiesObj: Record<string, string> = {};
    const serverCookies = cookies();
    serverCookies.getAll().forEach(({ name, value }) => {
        cookiesObj[name] = value;
    });
    return cookiesObj;
};

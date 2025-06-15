import {useAuth} from "@clerk/clerk-react"
import { useCallback } from "react"

export const useApi = () => {
    const {getToken} = useAuth()

    const MakeRequest = useCallback(async (endpoint, options = {}) => {
        const token = await getToken()
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/${endpoint}`, {
            ...defaultOptions,
            ...options
        })

        if(!response.ok){
            const errorData = await response.json()
            if(response.status == 429){
                throw new Error("Daily quota exceeded")
            }
            throw new Error(errorData?.detail || "An error occured")
        }

        return response.json()
    }, [getToken])
    return {MakeRequest}
}
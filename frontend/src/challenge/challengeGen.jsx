import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { MCQChallenge } from './MCQChallenge';
import { useApi } from '../utils/api';
import { useAuth } from '@clerk/clerk-react';

export function ChallengeGen() {
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [difficulty, setDifficulty] = useState('easy');
    const [quota, setQuota] = useState(null);
    const { MakeRequest } = useApi();
    const { isSignedIn, isLoaded } = useAuth()

    const fetchQuota = useCallback(async () => {
        try {
            const data = await MakeRequest("quota")
            setQuota(data)
        }catch(err){
            console.error("Error fetching quota:", err)
            setError(err.message)
        }
    }, [MakeRequest])

    useEffect(() => {
        if (isLoaded && isSignedIn){
            fetchQuota()
        }
    }, [isLoaded, isSignedIn, fetchQuota])

    
    const generateChallenge = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await MakeRequest("generate-challenge",{
                method: "POST",
                body: JSON.stringify({difficulty})
            })
            setChallenge(data)
            fetchQuota()
        } catch (error) {
            setError(error.message || "FAILED TO GENERATE CHALLENGE")
        } finally {
            setLoading(false)
        }
    }

    const getNextResetTime = () => {
        if (!quota?.last_reset_date) return null;
        const resetDate = new Date(quota.last_reset_date)
        resetDate.setHours(resetDate.getHours()+24)
        return resetDate
    }
    

    return <div className="challenge-container">
        <h2>Challenge Generator</h2>
        <div className="quota-display">
            <p>Limit Remaining today : {quota?.quota_remaining || 0}</p>
            {quota?.quota_remaining === 0 && (
                <p>Next Reset: {getNextResetTime()?.toLocaleString()}</p>
            )}
        </div>
        <div className="difficulty-selector">
            <label htmlFor="difficulty">Set Difficulty</label>
            <select 
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isLoading}
            >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>

        <button 
            className='generate-button'
            disabled={isLoading || (quota && quota.quota_remaining === 0)}
            onClick={generateChallenge}
        >
            {isLoading ? 'Generating...' : "Generate Challenge"}
        </button>

        {error && <div className='error-message'>
            <p>{error}</p>
        </div>}

        {challenge && <MCQChallenge challenge={challenge} />}
    </div>
}
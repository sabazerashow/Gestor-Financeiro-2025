import Constants from 'expo-constants';

// Get the host IP to reach the local server from the emulator/device
const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
const BASE_URL = `http://${host}:4000`;

export async function generateGLMContent(req) {
    console.log('Calling mobile AI GLM:', `${BASE_URL}/api/ai/glm`);
    const res = await fetch(`${BASE_URL}/api/ai/glm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
    });

    if (!res.ok) {
        let errorMessage = 'Falha ao chamar GLM API';
        try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorMessage;
        } catch {
            errorMessage = await res.text() || errorMessage;
        }
        throw new Error(errorMessage);
    }
    return await res.json();
}

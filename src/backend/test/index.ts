// test/index.ts
const testStream = async () => {
    try {
        const response = await fetch('http://localhost:8008/v1/chat/stream?conversationId=', {
            method: 'POST',
            body: {
                message: "halo"
            }
        });
        console.log(response)
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const lines = decoder.decode(value).split('\n').filter(line => line);
            for (const line of lines) {
                console.log(line)
                
                // switch (data.type) {
                //     case 'metadata':
                //         // Handle initial metadata
                //         console.log('Title:', data.title);
                //         console.log('Conversation ID:', data.conversationId);
                //         break;
                //     case 'content':
                //         // Handle streaming content
                //         console.log('Content chunk:', data.content);
                //         break;
                //     case 'end':
                //         // Handle stream completion
                //         console.log('Stream ended');
                //         break;
                //     case 'error':
                //         // Handle errors
                //         console.error('Error:', data.message);
                //         break;
                // }
            }
        }
    } catch (error) {
        console.error("Failed to connect to stream:", error);
    }
};

testStream();
// /api/sync-message.js
let messages = [];

export default function handler(req, res) {
  // CORS Headers für Cross-Origin Requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request für CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Neue Nachricht hinzufügen
    const { sender, content, timestamp, phase } = req.body;
    
    if (!sender || !content) {
      return res.status(400).json({ error: 'Sender und Content sind erforderlich' });
    }

    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      content,
      timestamp: timestamp || new Date().toISOString(),
      phase: phase || '1'
    };

    messages.push(newMessage);
    
    // Nur die letzten 100 Nachrichten behalten
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

    return res.status(200).json({ 
      success: true, 
      message: newMessage,
      total: messages.length 
    });
  }

  if (req.method === 'GET') {
    // Alle Nachrichten zurückgeben
    return res.status(200).json({ 
      messages: messages,
      total: messages.length,
      timestamp: new Date().toISOString()
    });
  }

  // Unsupported method
  res.status(405).json({ error: 'Method not allowed' });
}
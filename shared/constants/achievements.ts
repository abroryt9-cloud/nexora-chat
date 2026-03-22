export const achievementsList = [
  { id: 'first_message', name: 'First Message', description: 'Send your first message', icon: '💬', condition: (stats: any) => stats.totalMessages >= 1 },
  { id: '100_messages', name: 'Talkative', description: 'Send 100 messages', icon: '🗣️', condition: (stats: any) => stats.totalMessages >= 100 },
  { id: '1000_messages', name: 'Chatterbox', description: 'Send 1000 messages', icon: '📣', condition: (stats: any) => stats.totalMessages >= 1000 },
  { id: 'reaction_master', name: 'Reaction Master', description: 'Give 100 reactions', icon: '👍', condition: (stats: any) => stats.reactionsGiven >= 100 },
  { id: 'sticker_lover', name: 'Sticker Lover', description: 'Send 50 stickers', icon: '🎨', condition: (stats: any) => stats.stickersSent >= 50 },
  { id: 'voice_artist', name: 'Voice Artist', description: 'Send 20 voice messages', icon: '🎤', condition: (stats: any) => stats.voiceMessagesSent >= 20 },
  { id: 'poll_creator', name: 'Poll Creator', description: 'Create 10 polls', icon: '📊', condition: (stats: any) => stats.pollsCreated >= 10 },
];

import { defineSlashCommand } from 'chooksie';
import { makeRoom, userHasRoom } from '../functions/roomUtils';

export default defineSlashCommand({
	name: 'mkroom',
	description: 'Creates your own room!',
	async execute(ctx) {
		const interaction = ctx.interaction;
		const roomName = interaction.options.getString('roomname');
		if (roomName.length > 100) {
			await interaction.reply('Room name too long!');
			return;
		} else if (roomName.length < 2) {
			await interaction.reply('Room name too short!');
		} else {
			if (await userHasRoom(interaction)) {
				interaction.reply('You already have a room!');
			} else {
				makeRoom(interaction, roomName);
			}
		}
	},
	options: [
		{
			name: 'roomname',
			description: 'The room name.',
			type: 'STRING',
			required: true,
		},
	],
});

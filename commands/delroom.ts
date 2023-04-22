import { defineSlashCommand } from 'chooksie';
import { deleteRoom, getRoomID, userHasRoom } from '../functions/roomUtils';

export default defineSlashCommand({
	name: 'delroom',
	description: 'Deletes a room.',
	async execute(ctx) {
		const interaction = ctx.interaction;
		const roomID = await getRoomID(interaction);
		if (await userHasRoom(interaction)) {
			try {
				// delete room from discord server
				const channel = await interaction.client.channels.fetch(roomID);
				if (channel) {
					await channel.delete();
					await deleteRoom(roomID);
					await ctx.interaction.reply('Room deleted!');
				} else {
					await ctx.interaction.reply('Channel not found!');
				}
			} catch (error) {
				console.error(error);
				await ctx.interaction.reply('Error deleting channel!');
			}
		} else {
			await ctx.interaction.reply('Room does not exist!');
		}
	},
});

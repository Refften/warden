import { defineSlashCommand } from 'chooksie';
import {
	getRoomID,
	getRoomName,
	renameRoom,
	userHasRoom,
} from '../functions/roomUtils';

export default defineSlashCommand({
	name: 'renroom',
	description: 'Renames a room.',
	async execute(ctx) {
		const interaction = ctx.interaction;
		const newName = interaction.options.getString('newname');
		if (newName.length > 100) {
			await interaction.reply('Room name too long!');
			return;
		} else if (newName.length < 2) {
			await interaction.reply('Room name too short!');
		} else {
			if (await userHasRoom(interaction)) {
				const roomID = await getRoomID(interaction);
				if ((await getRoomName(roomID)) == newName) {
					interaction.reply("That's already the name of your room!");
					return;
				} else {
					await renameRoom(roomID, newName, interaction);
					interaction.reply('Room renamed!');
				}
			} else {
				interaction.reply("You don't have a room!");
			}
		}
	},
});

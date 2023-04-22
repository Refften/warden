import { defineSlashCommand } from 'chooksie';

export default defineSlashCommand({
	name: 'whereami',
	description: 'Tells you where you are.',
	async execute(ctx) {
		const interaction = ctx.interaction;
		interaction.reply(
			'You are in the room with ID ' + interaction.channelId,
		);
	},
});

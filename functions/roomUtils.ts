import { ChannelType } from 'discord.js';
import { Database } from 'sqlite3';

interface Room {
	roomID: string;
	userID: string;
	roomName: string;
}

const db = new Database('./storage/main.db', err => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the main database.');
});

/**
 * Create a room in the discord server and add it to the database
 * @param interaction the interaction object that contains the user ID
 * @param roomName the name of the room
 * @param categoryID the ID of the category to put the room in
 * @returns void
 * @throws an error if the room could not be created or added to the database
 **/

export function makeRoom(interaction: any, roomName: any) {
	const userId = interaction.user.id;
	const categoryID = process.env.ROOM_CATEGORY;
	try {
		interaction.guild.channels
			.create({
				name: roomName,
				type: ChannelType.GuildText,
				parent: categoryID,
			})
			// then set tempID to the id of the created channel
			.then((channel: { id: any }) => {
				let tempID = channel.id;
				console.log(tempID);

				// add created room to database
				// database has a table called "rooms" with columns "userID", "roomName", "roomID"
				db.run(
					`INSERT INTO rooms(userID, roomName, roomID) VALUES(?, ?, ?)`,
					[userId, roomName, tempID],
					function (err) {
						if (err) {
							return console.log(err.message);
						}
						// get the last insert id
						console.log(
							`A row has been inserted with row ID = ${this.lastID}`,
						);
					},
				);
				interaction.reply('Room created!');
			})

			.catch(console.error);
	} catch (error) {
		console.error(error);
		interaction.reply('Something went wrong!');
	}
}

/**
 * Check if the user has a room in the database
 * @param interaction the interaction object that contains the user ID
 * @returns a promise that resolves to true if the user has a room in the database
 **/
export function userHasRoom(interaction: any): Promise<boolean> {
	// get the user's ID from the interaction
	const userID = interaction.user.id;

	return new Promise((resolve, reject) => {
		// search table "rooms" for userID
		db.get(`SELECT * FROM rooms WHERE userID = ?`, [userID], (err, row) => {
			// if there is an error, reject the Promise
			if (err) {
				reject(err);
			} else {
				// convert row to a boolean value
				const output = Boolean(row);
				// resolve the Promise with the boolean value
				resolve(output);
			}
		});
	});
}

/**
 * Get the room ID associated with the user ID provided in the interaction
 * @param interaction the interaction object that contains the user ID
 * @returns a promise that resolves with the room ID if a room is found for the user
 */
export function getRoomID(interaction: any): Promise<string> {
	// get the user ID from the interaction object
	const userID = interaction.user.id;

	// return a promise that resolves to the room ID associated with the user
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT roomID FROM rooms WHERE userID = CAST(? AS TEXT)`,
			[userID.toString()],
			(err, row: Room | undefined) => {
				if (err) {
					// if there is an error, reject the promise
					reject(err);
				} else {
					if (row) {
						// if a room is found for the user, resolve the promise with the room ID as a string
						console.log(String(row.roomID));
						resolve(String(row.roomID));
					} else {
						// if no room is found for the user, reject the promise with an error
						reject(new Error(`No room found for user ${userID}`));
					}
				}
			},
		);
	});
}

/**
 * Delete the room with the specified ID from the database
 * @param roomID the ID of the room to delete
 * @returns a promise that resolves when the room has been deleted
 */
export function deleteRoom(roomID: string): Promise<void> {
	// return a promise that deletes the room with the specified ID
	return new Promise((resolve, reject) => {
		db.run(`DELETE FROM rooms WHERE roomID = ?`, [roomID], err => {
			if (err) {
				// if there is an error, reject the promise
				reject(err);
			} else {
				// if the row was deleted successfully, resolve the promise
				resolve();
			}
		});
	});
}

/**
 * Gets the name of the room from the database.
 * @param roomID The ID of the room in the database.
 * @returns The name of the room.
 */
export function getRoomName(roomID: string): Promise<string> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT roomName FROM rooms WHERE roomID = ?`,
			[roomID],
			(err, row: Room) => {
				if (err) {
					reject(err);
				} else {
					if (row) {
						resolve(row.roomName);
					} else {
						reject(new Error(`No room found with ID ${roomID}`));
					}
				}
			},
		);
	});
}

/**
 * Renames the room with the given ID to the given name.
 * @param roomID The ID of the room to rename.
 * @param newName The new name of the room.
 * @param interaction The interaction object that triggered this function.
 */
export function renameRoom(
	roomID: string,
	newName: string,
	interaction: any,
): Promise<void> {
	// set the name of the room with the specified ID to the new name on discord
	interaction.guild.channels.cache.get(roomID).setName(newName);
	// now update the database
	return new Promise((resolve, reject) => {
		db.run(
			`UPDATE rooms SET roomName = ? WHERE roomID = ?`,
			[newName, roomID],
			err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			},
		);
	});
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// export function uniquePlayerNamesValidator(): ValidatorFn {
//   return (control: AbstractControl): ValidationErrors | null => {
//     const player1 = control.get('player1')?.value;
//     const player2 = control.get('player2')?.value;
//     const player3 = control.get('player3')?.value;
//     const player4 = control.get('player4')?.value;

//     const players = [player1, player2, player3, player4];
//     const uniquePlayers = new Set(players);

//     return uniquePlayers.size === players.length ? null : { nonUniquePlayers: true };
//   };
// }


export function uniquePlayerNamesValidator(playerFields: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Extract the values from the form based on the player fields provided
    const players = playerFields.map(field => control.get(field)?.value);

    // Remove any null or undefined values (in case any fields are empty)
    const validPlayers = players.filter(player => player);

    // Create a set to check for unique player names
    const uniquePlayers = new Set(validPlayers);

    // If the size of the set is smaller than the number of valid players, there are duplicates
    return uniquePlayers.size === validPlayers.length ? null : { nonUniquePlayers: true };
  };
}

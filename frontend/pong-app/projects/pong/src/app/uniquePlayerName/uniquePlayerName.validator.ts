import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function uniquePlayerNamesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const player1 = control.get('player1')?.value;
    const player2 = control.get('player2')?.value;
    const player3 = control.get('player3')?.value;
    const player4 = control.get('player4')?.value;

    const players = [player1, player2, player3, player4];
    const uniquePlayers = new Set(players);

    return uniquePlayers.size === players.length ? null : { nonUniquePlayers: true };
  };
}
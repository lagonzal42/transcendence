import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})

export class TranslationService {
    private currentLang = new BehaviorSubject<string>('en');
    currentLang$ = this.currentLang.asObservable();

    private translations: {[key: string]: {[key: string]: string}} = {
        en: {
            // Header
            'HOME': 'Home',
            'PROFILE': 'Profile',
            'LOGIN': 'Login',
            'LOGOUT': 'Logout',
            'UPDATE_PROFILE': 'Update Profile',
            'SEARCH': 'Search',
            
            // Home Component
            'PLAY_2_PLAYERS': '2 PLAYERS',
            'PLAY_4_PLAYERS': '4 PLAYERS',
            'TOURNAMENT': 'TOURNAMENT',
            'TUTORIAL': 'TUTORIAL',
            'SIGN_UP': 'SIGN UP',
            'SIGN_OUT': 'SIGN OUT',
            
            // Local Play Component
            'NAME_SELECTION': 'Name Selection',
            'PLAYER_1': 'Player 1',
            'PLAYER_2': 'Player 2',
            'PLAYER_2_TYPE': 'Player 2 Type',
            'PLAY_AS_GUEST': 'Play as Guest',
            'PLAY_AS_REGISTERED': 'Play as Registered User',
            'VERIFY_PLAYER_2': 'Verify Player 2',
            'INVALID_NAME': 'Invalid name',
            'USERNAME': 'Username',
            'PASSWORD': 'Password',
            
            // Update Profile Component
            'UPDATE_PROFILE_TITLE': 'Update Profile',
            'DISPLAY_NAME': 'Display Name',
            'EMAIL': 'Email',
            'AVATAR': 'Avatar',
            'INVALID_EMAIL': 'Please enter a valid email address',
            
            // Tournament Component
            'TOURNAMENT_SETUP': 'Tournament Setup',
            'START_TOURNAMENT': 'Start Tournament',
            'CURRENT_ROUND': 'Current Round',
            'WINNER': 'Winner',
            
            // 2FA Component
            'TWO_FACTOR_AUTH': 'TWO FACTOR AUTH',
            '2FA_CODE': '2FA CODE',
            'VERIFY': 'VERIFY'
        },
        es: {
            // Header
            'HOME': 'Inicio',
            'PROFILE': 'Perfil',
            'LOGIN': 'Iniciar Sesión',
            'LOGOUT': 'Cerrar Sesión',
            'UPDATE_PROFILE': 'Actualizar Perfil',
            'SEARCH': 'Buscar',
            
            // Home Component
            'PLAY_2_PLAYERS': '2 JUGADORES',
            'PLAY_4_PLAYERS': '4 JUGADORES',
            'TOURNAMENT': 'TORNEO',
            'TUTORIAL': 'TUTORIAL',
            'SIGN_UP': 'REGISTRARSE',
            'SIGN_OUT': 'CERRAR SESIÓN',
            
            // Local Play Component
            'NAME_SELECTION': 'Selección de Nombres',
            'PLAYER_1': 'Jugador 1',
            'PLAYER_2': 'Jugador 2',
            'PLAYER_2_TYPE': 'Tipo de Jugador 2',
            'PLAY_AS_GUEST': 'Jugar como Invitado',
            'PLAY_AS_REGISTERED': 'Jugar como Usuario Registrado',
            'VERIFY_PLAYER_2': 'Verificar Jugador 2',
            'INVALID_NAME': 'Nombre inválido',
            'USERNAME': 'Nombre de usuario',
            'PASSWORD': 'Contraseña',
            
            // Update Profile Component
            'UPDATE_PROFILE_TITLE': 'Actualizar Perfil',
            'DISPLAY_NAME': 'Nombre para mostrar',
            'EMAIL': 'Correo electrónico',
            'AVATAR': 'Avatar',
            'INVALID_EMAIL': 'Por favor ingrese un correo electrónico válido',
            
            // Tournament Component
            'TOURNAMENT_SETUP': 'Configuración del Torneo',
            'START_TOURNAMENT': 'Iniciar Torneo',
            'CURRENT_ROUND': 'Ronda Actual',
            'WINNER': 'Ganador',
            
            // 2FA Component
            'TWO_FACTOR_AUTH': 'AUTENTICACIÓN DE DOS FACTORES',
            '2FA_CODE': 'CÓDIGO 2FA',
            'VERIFY': 'VERIFICAR'
        },
        fr: {
            // Header
            'HOME': 'Accueil',
            'PROFILE': 'Profil',
            'LOGIN': 'Connexion',
            'LOGOUT': 'Déconnexion',
            'UPDATE_PROFILE': 'Mettre à jour le profil',
            'SEARCH': 'Rechercher',
            
            // Home Component
            'PLAY_2_PLAYERS': '2 JOUEURS',
            'PLAY_4_PLAYERS': '4 JOUEURS',
            'TOURNAMENT': 'TOURNOI',
            'TUTORIAL': 'TUTORIEL',
            'SIGN_UP': 'S\'INSCRIRE',
            'SIGN_OUT': 'SE DÉCONNECTER',
            
            // Local Play Component
            'NAME_SELECTION': 'Sélection du nom',
            'PLAYER_1': 'Joueur 1',
            'PLAYER_2': 'Joueur 2',
            'PLAYER_2_TYPE': 'Type de Joueur 2',
            'PLAY_AS_GUEST': 'Jouer en tant qu\'invité',
            'PLAY_AS_REGISTERED': 'Jouer en tant qu\'utilisateur enregistré',
            'VERIFY_PLAYER_2': 'Vérifier Joueur 2',
            'INVALID_NAME': 'Nom invalide',
            'USERNAME': 'Nom d\'utilisateur',
            'PASSWORD': 'Mot de passe',
            
            // Update Profile Component
            'UPDATE_PROFILE_TITLE': 'Mettre à jour le profil',
            'DISPLAY_NAME': 'Nom d\'affichage',
            'EMAIL': 'Email',
            'AVATAR': 'Avatar',
            'INVALID_EMAIL': 'Veuillez entrer une adresse email valide',
            
            // Tournament Component
            'TOURNAMENT_SETUP': 'Configuration du tournoi',
            'START_TOURNAMENT': 'Démarrer le tournoi',
            'CURRENT_ROUND': 'Tour actuel',
            'WINNER': 'Gagnant',
            
            // 2FA Component
            'TWO_FACTOR_AUTH': 'AUTHENTIFICATION À DEUX FACTEURS',
            '2FA_CODE': 'CODE 2FA',
            'VERIFY': 'VÉRIFIER'
        }
    };

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        // Only access localStorage in browser environment
        if (isPlatformBrowser(this.platformId)) {
            const savedLang = localStorage.getItem('preferred_language');
            if (savedLang) {
                this.setLanguage(savedLang);
            }
        }
    }

    setLanguage(lang: string) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('preferred_language', lang);
        }
        this.currentLang.next(lang);
    }

    translate(key: string): string {
        const currentLang = this.currentLang.value;
        return this.translations[currentLang][key] || key;
    }
}
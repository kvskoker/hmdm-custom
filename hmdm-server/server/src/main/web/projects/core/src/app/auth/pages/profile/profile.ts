import { Component } from '@angular/core';
import { ProfilePassword } from '../../components/profile-password/profile-password';
import { ProfileUser } from '../../components/profile-user/profile-user';

@Component({
  selector: 'app-profile',
  imports: [ProfileUser, ProfilePassword],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {}

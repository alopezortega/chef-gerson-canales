import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  protected readonly featuredServices = [
    {
      title: 'Cenas privadas en casa',
      description: 'Una experiencia gastronómica personalizada en un entorno íntimo y cuidado.',
      slug: 'cenas-privadas',
    },
    {
      title: 'Celebraciones familiares',
      description: 'Propuestas adaptadas para cumpleaños, aniversarios y encuentros especiales.',
      slug: 'celebraciones-familiares',
    },
    {
      title: 'Eventos corporativos pequeños',
      description:
        'Servicios gastronómicos para reuniones de equipo, presentaciones y encuentros profesionales.',
      slug: 'eventos-corporativos',
    },
    {
      title: 'Catering para reuniones y encuentros',
      description:
        'Opciones flexibles para grupos reducidos, adaptadas al espacio y al tipo de evento.',
      slug: 'catering-reuniones',
    },
    {
      title: 'Talleres y experiencias gastronómicas',
      description: 'Actividades participativas para aprender, cocinar y disfrutar en grupo.',
      slug: 'talleres-gastronomicos',
    },
    {
      title: 'Menús personalizados',
      description:
        'Propuestas creadas según gustos, necesidades y características de cada ocasión.',
      slug: 'menus-personalizados',
    },
  ] as const;
}

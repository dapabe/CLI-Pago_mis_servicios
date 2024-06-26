# CLI-Pago mis servicios

Este proyecto es una herramienta de línea de comandos (_CLI_), desarrollado en Node.JS tiene como finalidad automatizar el proceso de verificación y pago de todos los servicios e impuestos a los que uno esta adherido de las siguientes [empresas](#services) y no pretende hacer competencia con las mismas, sino, facilitar el uso de estas.

## Tabla de contenidos

- [¿Cómo funciona?](#workings)
- [Seguridad](#segurity)
- [¿Qué empresas o servicios puedo usar?](#which-services)
- [¿Cómo puedo colaborar?](#colaborate)
  [Instalación](#install)
- [Servicios actualmente soportados](#services)
- [Licencia](#licence)

### [¿Cómo funciona?](#workings)

En _esencia_ es como el débito automático, en el sentido dejas que el comando junto con tus datos de inicio de sesión y formas de pago, haga los pasos que harías tu al pagar manualmente, lo escribes una vez y nunca más.
Específicamente el software pide estos pasos a seguir:

1. Te pedirá contraseña para encriptar y desencriptar tus datos.
2. Seleccionas que servicio uses y posteriormente ingresas tus credenciales de inicio de sesión.
3. La herramienta navegara a las páginas de los servicios elegidos y mostrara el ultimo monto pagado o por pagar.
4. Elige si quieres hacer el pago individual o todos al mismo tiempo.

### [Seguridad](#security)

Este proyecto toma la seguridad muy en serio, tus credenciales y datos sensibles como métodos de pago se almacenan en un archivo encriptado localmente en tu computadora protegida por contraseña que también esta cifrada contra muchos métodos de ataque.
Cabe resaltar que no debes apretar links ni descargar programas de dudosa procedencia que pongan en riesgo tu ordenador.

> Nota del creador: Tus datos no me conciernen, creé esta herramienta para ser segura por naturaleza y de código libre para ganarme su confianza. ¡Feliz Automatización!

### [¿Qué empresas o servicios puedo usar?](#which-services)

La verdad es que cualquiera que cumpla con los siguientes puntos:

- Lo permita sus **Términos y condiciones**.
- Tengas un usuario asociado al servicio que intentas pagar.
- Tener botón de pago.
- (Próximamente) Efectuar pago directo.

### [¿Cómo puedo colaborar?](#colaborate)

Si conoces un servicio que no este listado que cumpla con los puntos de la sección anterior puedes compartirlo creando una [_Issue_](https://github.com/dapabe/cli-pago-mis-impuestos/issues) de este repositorio.

Si tienes sugerencias para hacer mas eficiente o mas seguro el código no dudes en compartirlo dando tu explicación creando una _pull request_.

[Requisitos](#install):

- [node v^20.10.0](#https://nodejs.org/en/download/package-manager)
- [pnpm v^9.4.0](#https://pnpm.io/installation)

```bash
pnpm install
pnpm start
```

o también pero más lento:

```bash
npm install
npx tsx src/index.ts
```

### [Actualmente se soporta](#services)

| Empresa    | Términos y condiciones                                          | Funciona |
| ---------- | --------------------------------------------------------------- | -------- |
| Aysa       | [Link](<(#https://www.aysa.com.ar/Terminos_y_condiciones)>)     | ❓       |
| Edesur     | [Link](https://www.edesur.com.ar/acerca-de-edesur/proveedores/) | ❓       |
| Telecentro | [Link](https://telecentro.com.ar/terminos)                      | 🆗       |

### [Licencia](#licence)

Este proyecto está bajo la Licencia Apache 2.0. Ver el archivo [LICENCE](./LICENCE.txt) para mas detalles.

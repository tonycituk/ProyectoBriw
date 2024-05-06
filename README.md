# ProyectoBRIW


Para poder ejecutar el frontEnd necesitas  instalar

- [**xammp**](https://www.apachefriends.org/es/index.html)
- [**node.js**](https://nodejs.org/en)
- [**nvm**](https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.exe)
- [**TailSense**](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [**wkhtmltopdf**](https://wkhtmltopdf.org/index.html)

Es necesario poner el archivo bin del programa wkhtmltopdf en las variables de entorno del sistema para que el BRIW pueda renderizar las imagenes.

También es necesario ejecutar XAAMP como un administrastrador para que el BRIW pueda funcionar como debe.

Para ejecutar el frontEnd (Una vez instalado lo anterior)

~~~
nvm install 21.7.3
cd Front/frontBRIW
npm install
npm run dev
~~~

Luego, cuando se termine el proyecto vamos a compilarlo y pasarlo al xampp




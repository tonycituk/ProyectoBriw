# ProyectoBRIW
# ProyectoBRIW


Para poder ejecutar el frontEnd necesitas  instalar

- [**xammp**](https://www.apachefriends.org/es/index.html)
- [**node.js**](https://nodejs.org/en)
- [**nvm**](https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.exe)
- [**TailSense**](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [**Solr**](https://www.apache.org/dyn/closer.lua/solr/solr/9.6.1/solr-9.6.1-src.tgz?action=download) //Preguntarme de como iniciarlo
- [**wkhtmltoimg**](https://wkhtmltopdf.org/downloads.html)

La carpeta del respositiorio debe de estar en C:/../xammp/htdocs/BRIW

Para ejecuar el frontEnd (Una vez instalado lo anterior)

~~~
nvm install 21.7.3
cd Front/frontBRIW
npm install
npm run dev
~~~

Es necesario poner el archivo bin del programa wkhtmltopdf en las variables de entorno del sistema para que el BRIW pueda renderizar las imagenes.

También es necesario ejecutar XAAMP como un administrastrador para que el BRIW pueda funcionar como debe.




IS4103

How to start:
1. Open docker application. 
Run ```yarn docker-start```
2. Run ```yarn-start``` for prod or ```yarn start-dev``` for development

Project structure:
```
API called:
-> Routes 
-> Controller
-> DelegationService** (use d.service if it is a complex function, else skip d.service)
-> Service
-> Repository** (use repository class if it is a complex query, use repository class. Else doing it in the service class will do too.)
```

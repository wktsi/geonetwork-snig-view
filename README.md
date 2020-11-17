# Interface customizada do GeoNetwork para utilização no âmbito SNIG

Este projeto implementa uma interface customizada (*skin*) do GeoNetwork para utilização no âmbito do SNIG. A base inicial para a sua implementação foi a solução equivalente desenvolvida para o catálogo de metadados da Holanda (https://github.com/osgeonl/geonetwork-dutch-skin).

# Instalação do módulo

## Versão do GeoNetwork a utilizar com este módulo

A utilização deste módulo exige que seja utilizada a versão adaptada do GeoNetwork para o SNIG (https://github.com/wktsi/core-geonetwork). Esta adaptação foi desenvolvida com base no GeoNetwork 3.4.x.

## Adicionar a *skin* ao código fonte

A versão adaptada do GeoNetwork para o SNIG (https://github.com/wktsi/core-geonetwork) adiciona automaticamente esta *skin* como um submódulo do projeto, pelo que apenas é necessário seguir as instruções de instalação dessa versão. Caso se pretenda proceder à sua integração numa versão base do GeoNetwork 3.4+, os procedimentos a realizar são os seguintes:
1. Mudar para a pasta *core-geonetwork/web-ui/src/main/resources/catalog/views*
2. Adicionar o projeto da *skin* como um submódulo 
```
git submodule add -b 3.4.x https://github.com/ricardogsena/geonetwork-snig-view snig
git submodule init
```

## Integrar a *skin* numa instalação existente do GeoNetwork

- Fazer download do ficheiro zip da *skin* em https://github.com/wktsi/geonetwork-snig-view/archive/3.4.x.zip
- Descompactar o conteúdo do ficheiro para a pasta */geonetwork/catalog/views/snig*

## Utilização da *skin*

Esta *skin* foi desenvolvida para ser utilizada no âmbito do portal do Registo Nacional de Dados Geográficos (https://snig.dgterritorio.gov.pt/rndg), pelo que as funcionalidades que implementa estão directamente relacionadas com os objectivos e requistos definidos para este sistema. Algumas das funcionalidades de pesquisa nesta skin exigem a utilização da versão adaptada do GeoNetwork para o SNIG (https://github.com/wktsi/core-geonetwork) e do template de metadados iso19139.pt.mig.2.0 (https://github.com/wktsi/iso19139.pt.mig.2.0).

Para testar a *skin* adiciona-se o parâmetro `view=snig` ao url de acesso ao GeoNetwork:
- http://<geonetwork_path>/srv/por/catalog.search?**view=snig**

Estando a funcionar corretamente, poderá optar-se por definir esta *skin* como interface por defeito do GeoNetwork, devendo para isso atribuir o valor "snig" em 'Admin > Settings > User interface configuration > Choose the user interface to use'

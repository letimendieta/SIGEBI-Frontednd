import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ParametroModelo } from '../modelos/parametro.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearParametro( parametro: ParametroModelo ) {

    return this.http.post(`${ this.url }/parametros`, parametro);

  }

  actualizarParametro( parametro: ParametroModelo ) {

    const parametroTemp = {
      ...parametro
    };

    return this.http.put(`${ this.url }/parametros/`, parametroTemp);


  }

  borrarParametro( id: number ) {

    return this.http.delete(`${ this.url }/parametros/${ id }`);

  }


  getParametro( id: number ) {

    return this.http.get(`${ this.url }/parametros/${ id }`);

  }


  getParametros() {
    return this.http.get(`${ this.url }/parametros`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarParametros() {
    return this.http.get(`${ this.url }/parametros/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarParametrosFiltros( parametro: ParametroModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = parametro == null ? new ParametroModelo() : parametro;
    
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');
    
    return this.http.get(`${ this.url }/parametros/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarParametrosFiltrosOrder( parametro: ParametroModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = parametro == null ? new ParametroModelo() : parametro;
    
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');
    
    return this.http.get(`${ this.url }/parametros/buscar/`,{params:params});
  }

  buscarParametrosFiltrosTabla( parametro: ParametroModelo ) {
    let params = new HttpParams();
    var filtros = parametro == null ? new ParametroModelo() : parametro;
    
    params = params.append('filtros', JSON.stringify(filtros));
    //params = params.append('orderBy', orderBy);
    //params = params.append('orderDir', orderDir);
    return this.http.get(`${ this.url }/parametros/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  private crearArreglo( parametrosObj: object ) {

    const parametros: ParametroModelo[] = [];

    Object.keys( parametrosObj ).forEach( key => {

      const parametro: ParametroModelo = parametrosObj[key];
      parametros.push( parametro );
    });

    return parametros;

  }
}

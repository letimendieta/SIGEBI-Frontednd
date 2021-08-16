import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VacunaModelo } from '../modelos/vacuna.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class VacunasService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearVacuna( vacuna: VacunaModelo ) {

    return this.http.post(`${ this.url }/vacunas`, vacuna);

  }

  actualizarVacuna( vacuna: VacunaModelo ) {

    const VacunaTemp = {
      ...vacuna
    };

    return this.http.put(`${ this.url }/vacunas/`, VacunaTemp);


  }

  borrarVacuna( id: number ) {

    return this.http.delete(`${ this.url }/vacunas/${ id }`);

  }


  getVacuna( id: number ) {

    return this.http.get(`${ this.url }/vacunas/${ id }`);

  }


  getVacunas() {
    return this.http.get(`${ this.url }/vacunas`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarVacunas() {
    return this.http.get(`${ this.url }/vacunas/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarVacunasFiltros( vacuna: VacunaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = vacuna == null ? new VacunaModelo() : vacuna;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/vacunas/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarVacunasFiltrosTabla( vacuna: VacunaModelo ) {
    let params = new HttpParams();
    var filtros = vacuna == null ? new VacunaModelo() : vacuna;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/vacunas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  buscarVacunasFiltrosTablaOrder( vacuna: VacunaModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = vacuna == null ? new VacunaModelo() : vacuna;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/vacunas/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( VacunasObj: object ) {

    const vacunas: VacunaModelo[] = [];

    Object.keys( VacunasObj ).forEach( key => {

      const vacuna: VacunaModelo = VacunasObj[key];
      vacunas.push( vacuna );
    });

    return vacunas;

  }
}

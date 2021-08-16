import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';
import { MedicamentoModelo } from '../modelos/medicamento.modelo';

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearMedicamento( medicamento: MedicamentoModelo ) {

    return this.http.post(`${ this.url }/medicamentos`, medicamento);

  }

  actualizarMedicamento( medicamento: MedicamentoModelo ) {

    const MedicamentoTemp = {
      ...medicamento
    };

    return this.http.put(`${ this.url }/medicamentos`, MedicamentoTemp);


  }

  borrarMedicamento( id: number ) {

    return this.http.delete(`${ this.url }/medicamentos/${ id }`);

  }


  getMedicamento( id: number ) {

    return this.http.get(`${ this.url }/medicamentos/${ id }`);

  }


  getMedicamentos() {
    return this.http.get(`${ this.url }/medicamentos`)
            .pipe(
              map( this.crearArregloMedicamentos ),
              delay(0)
            );
  }

  buscarMedicamentos() {
    return this.http.get(`${ this.url }/medicamentos/buscar`)
            .pipe(
              map( this.crearArregloMedicamentos ),
              delay(0)
            );
  }

  buscarMedicamentosFiltros( horario: MedicamentoModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = horario == null ? new MedicamentoModelo() : horario;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/medicamentos/buscar/`,{params:params})
    .pipe(
      map( this.crearArregloMedicamentos ),
      delay(0)
    );
  }

  buscarMedicamentosFiltrosTabla( medicamento: MedicamentoModelo ) {
    let params = new HttpParams();
    var filtros = medicamento == null ? new MedicamentoModelo() : medicamento;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/medicamentos/buscar/`,{params:params})
      .pipe(
        map( this.crearArregloMedicamentos ),
        delay(0)
      );
  }

  private crearArregloMedicamentos( MedicamentosObj: object ) {

    const medicamentos: MedicamentoModelo[] = [];

    Object.keys( MedicamentosObj ).forEach( key => {

      const medicamento: MedicamentoModelo = MedicamentosObj[key];
      medicamentos.push( medicamento );
    });

    return medicamentos;

  }
}

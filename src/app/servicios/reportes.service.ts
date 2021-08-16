import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';
import { PatologiaProcedimientoModelo } from '../modelos/patologiaProcedimiento.modelo';
import { Reporte2Modelo } from '../modelos/reporte2.modelo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }



  generarReporte(reporte: Reporte2Modelo): Observable<Blob> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const options = {
      headers: httpHeaders,
      responseType: 'blob' as 'json'
    };
    const body = {  };
    return this.http.post<any>(
      this.url + '/reportes/union-estamentos?anho='+reporte.anho+'&mes='+reporte.mes+'&formato=pdf',
      body,
      options
    );
  }

}

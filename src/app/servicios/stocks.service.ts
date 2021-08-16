import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StockModelo } from '../modelos/stock.modelo';
import { map, delay } from 'rxjs/operators';
import { HttpParams } from "@angular/common/http";
import { GlobalConstants } from '../common/global-constants';

@Injectable({
  providedIn: 'root'
})
export class StocksService {

  private url = GlobalConstants.apiUrlBackend;

  constructor( private http: HttpClient ) { }


  crearStock( stock: StockModelo ) {

    return this.http.post(`${ this.url }/stock`, stock);

  }

  actualizarStock( stock: StockModelo ) {

    const StockTemp = {
      ...stock
    };

    return this.http.put(`${ this.url }/stock/`, StockTemp);


  }

  borrarStock( id: number ) {

    return this.http.delete(`${ this.url }/stock/${ id }`);

  }


  getStock( id: number ) {

    return this.http.get(`${ this.url }/stock/${ id }`);

  }


  getStocks() {
    return this.http.get(`${ this.url }/stock`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarStocks() {
    return this.http.get(`${ this.url }/stock/buscar`)
            .pipe(
              map( this.crearArreglo ),
              delay(0)
            );
  }

  buscarStocksFiltros( stock: StockModelo, orderBy:string, orderDir:string ) {
    let params = new HttpParams();
    var filtros = stock == null ? new StockModelo() : stock;
    params = params.append('filtros', JSON.stringify(filtros));
    params = params.append('orderBy', orderBy);
    params = params.append('orderDir', orderDir);
    params = params.append('size', '-1');

    return this.http.get(`${ this.url }/stock/buscar/`,{params:params})
    .pipe(
      map( this.crearArreglo ),
      delay(0)
    );
  }

  buscarStocksFiltrosTabla( stock: StockModelo ) {
    let params = new HttpParams();
    var filtros = stock == null ? new StockModelo() : stock;
    
    params = params.append('filtros', JSON.stringify(filtros));
    return this.http.get(`${ this.url }/stock/buscar/`,{params:params})
      .pipe(
        map( this.crearArreglo ),
        delay(0)
      );
  }

  private crearArreglo( StocksObj: object ) {

    const stocks: StockModelo[] = [];

    Object.keys( StocksObj ).forEach( key => {

      const stock: StockModelo = StocksObj[key];
      stocks.push( stock );
    });

    return stocks;

  }
}

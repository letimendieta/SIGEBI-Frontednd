import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StocksService } from '../../../servicios/stocks.service';
import { StockModelo } from '../../../modelos/stock.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { InsumoMedicoModelo } from 'src/app/modelos/insumoMedico.modelo';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InsumosMedicosService } from 'src/app/servicios/insumosMedicos.service';
import { MedicamentoModelo } from 'src/app/modelos/medicamento.modelo';
import { MedicamentosService } from 'src/app/servicios/medicamentos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtOptionsInsumos: any = {};
  dtOptionsMedicamentos: any = {};
  dtTrigger : Subject<any> = new Subject<any>();
  dtTriggerMedicamentos : Subject<any> = new Subject<any>();
  insumos: InsumoMedicoModelo[] = [];
  medicamentos: MedicamentoModelo[] = [];
  stocks: StockModelo[] = [];  
  buscadorForm: FormGroup;
  buscadorInsumoForm: FormGroup;
  buscadorMedicamentoForm: FormGroup;
  //stockForm: FormGroup;
  cargando = false;  
  alert:boolean=false;
  alertMedicamento:boolean=false;
  loadBuscadorInsumo = false;
  loadBuscadorMedicamento = false;

  constructor( private stocksService: StocksService,
               private insumosService: InsumosMedicosService,
               private medicamentosService: MedicamentosService,
               private comunes: ComunesService,
               public router: Router,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private fb4: FormBuilder,
               private modalService: NgbModal ) {    
  }

  ngOnInit() { 
    this.crearFormulario();
    this.crearTabla();
  }

  crearTabla(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'stockId'}, {data:'insumosMedicos.insumoMedicoId'}, 
        {data:'insumosMedicos.codigo'},
        {data:'insumosMedicos.nombre'}, 
        {data:'medicamentos.medicamentoId'}, 
        {data:'medicamentos.codigo'},
        {data:'medicamentos.medicamento'},
        {data:'cantidad'},
        {data:'fechaCreacion'}, {data:'usuarioCreacion'},
        {data:'fechaModificacion'},{data:'usuarioModificacion'},
        {data:'Editar'}
        //{data:'Borrar'}
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de stocks',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de stocks',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de stocks',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de stocks',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
          },
          customize: function ( win ) {
            $(win.document.body)
                .css( 'font-size', '10pt' )
                .prepend(
                    '<img src= ' + GlobalConstants.imagenReporteListas + ' style="position:absolute; top:400; left:400;" />'
                );

            $(win.document.body).find( 'table' )
                .addClass( 'compact' )
                .css( 'font-size', 'inherit' );
          }              
        }
      ]
    };
  }

  buscadorStocks(event) {
    event.preventDefault();
    this.cargando = true;
    this.stocks = [];
    this.rerender();
    var buscador: StockModelo = new StockModelo();
    var insumos = new InsumoMedicoModelo();
    var medicamentos = new MedicamentoModelo();
    buscador.stockId = this.buscadorForm.get('stockId').value;
    insumos.insumoMedicoId = this.buscadorForm.get('insumoMedicoId').value;
    insumos.nombre = this.buscadorForm.get('nombre').value;

    medicamentos.medicamentoId = this.buscadorForm.get('medicamentoId').value;
    medicamentos.medicamento = this.buscadorForm.get('medicamento').value;

    buscador.insumosMedicos = insumos;
    buscador.medicamentos = medicamentos;

    if(!buscador.insumosMedicos.insumoMedicoId && !buscador.insumosMedicos.codigo 
      && !buscador.insumosMedicos.nombre){
      buscador.insumosMedicos = null;
    } 

    if(!buscador.medicamentos.medicamentoId && !buscador.medicamentos.medicamento){
      buscador.medicamentos = null;
    } 
    this.stocksService.buscarStocksFiltrosTabla(buscador)
    .subscribe( resp => {      
      this.stocks = resp;
      this.dtTrigger.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e),
      })
      this.cargando = false;
      this.dtTrigger.next();
    });
  }

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.stocks = [];
    this.rerender();
    this.dtTrigger.next();
  }

  borrarStock(event, stock: StockModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar ${ stock.stockId }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.stocksService.borrarStock( stock.stockId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: stock.stockId.toString(),
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorStocks(event);
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'info',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e)
            })
            this.cargando = false;
          }
        );
      }
    });
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
      if(e.error.mensaje){
        mensaje = e.error.mensaje;
      }
      if(e.error.message){
        mensaje = e.error.message;
      }
      if(e.error.errors){
        mensaje = mensaje + ' ' + e.error.errors[0];
      }
      if(e.error.error){
        mensaje = mensaje + ' ' + e.error.error;
      }
    return mensaje;  
  }

  crearFormulario() {

    this.buscadorForm = this.fb.group({
      stockId  : ['', [] ],
      insumoMedicoId : ['', [] ],
      medicamentoId : ['', [] ],
      nombre  : ['', [] ],
      medicamento  : ['', [] ]
    });

    this.buscadorInsumoForm = this.fb2.group({
      insumoMedicoId  : [null, [] ],
      codigo  : [null, [] ],
      nombre  : [null, [] ]
    });

    this.buscadorMedicamentoForm = this.fb3.group({
      medicamentoId  : [null, [] ],
      codigo  : [null, [] ],
      medicamento  : [null, [] ]
    });
  }

  openModal(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorInsumoForm.patchValue({
      insumoMedicoId: null,
      codigo: null,
      nombre: null
    });
    this.insumos = [];
    this.alert=false;
  }

  openModalMedicamento(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorMedicamentoForm.patchValue({
      medicamentoId: null,
      codigo: null,
      medicamento: null
    });
    this.medicamentos = [];
    this.alertMedicamento=false;
  }
  

  selectInsumo(event, insumo: InsumoMedicoModelo){
    this.modalService.dismissAll();
    /*if(insumo.insumoMedicoId){
      this.stockForm.get('insumosMedicos').get('insumoMedicoId').setValue(insumo.insumoMedicoId);
    }*/
    this.insumosService.getInsumo( insumo.insumoMedicoId )
      .subscribe( (resp: InsumoMedicoModelo) => {
        this.buscadorForm.get('insumoMedicoId').setValue(resp.insumoMedicoId);
        this.buscadorForm.get('nombre').setValue(resp.nombre);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.buscadorForm.get('insumoMedicoId').setValue(null);
        }
      );
  }

  selectMedicamento(event, medicamento: MedicamentoModelo){
    this.modalService.dismissAll();
    /*if(insumo.insumoMedicoId){
      this.stockForm.get('insumosMedicos').get('insumoMedicoId').setValue(insumo.insumoMedicoId);
    }*/
    this.medicamentosService.getMedicamento( medicamento.medicamentoId )
      .subscribe( (resp: MedicamentoModelo) => {
        this.buscadorForm.get('medicamentoId').setValue(resp.medicamentoId);
        this.buscadorForm.get('medicamento').setValue(resp.medicamento);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.buscadorForm.get('medicamentoId').setValue(null);
        }
      );
  }

  buscadorInsumos(event) {
    event.preventDefault();
    var buscador = new InsumoMedicoModelo();
    buscador = this.buscadorInsumoForm.getRawValue();

    if(!buscador.insumoMedicoId && !buscador.codigo
      && !buscador.nombre){
      this.alert=true;
      return;
    }
    this.loadBuscadorInsumo = true;
    this.insumosService.buscarInsumosMedicosFiltrosTabla(buscador)
    .subscribe( resp => {
      this.loadBuscadorInsumo = false;
      this.insumos = resp;
    }, e => {
      this.loadBuscadorInsumo = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  buscadorMedicamentos(event) {
    event.preventDefault();
    var buscador = new MedicamentoModelo();
    buscador = this.buscadorMedicamentoForm.getRawValue();

    if(!buscador.medicamentoId && !buscador.codigo && !buscador.medicamento){
      this.alertMedicamento=true;
      return;
    }
    this.loadBuscadorMedicamento = true;
    this.medicamentosService.buscarMedicamentosFiltrosTabla(buscador)
    .subscribe( resp => {
      this.loadBuscadorMedicamento = false;
      this.medicamentos = resp;
    }, e => {
      this.loadBuscadorMedicamento = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['stock', id]);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  limpiarModal(event) {
    event.preventDefault();
    this.buscadorInsumoForm.reset();
    this.insumos = [];
  }

  limpiarModalMedicamento(event) {
    event.preventDefault();
    this.buscadorMedicamentoForm.reset();
    this.medicamentos = [];
  }

  cerrarAlert(){
    this.alert=false;
  }

  cerrarAlertMedicamento(){
    this.alertMedicamento=false;
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

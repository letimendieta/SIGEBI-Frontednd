import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { StockModelo } from '../../../modelos/stock.modelo';
import { StocksService } from '../../../servicios/stocks.service';
import { InsumosMedicosService } from '../../../servicios/insumosMedicos.service';
import Swal from 'sweetalert2';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InsumoMedicoModelo } from 'src/app/modelos/insumoMedico.modelo';
import { MedicamentoModelo } from 'src/app/modelos/medicamento.modelo';
import { MedicamentosService } from 'src/app/servicios/medicamentos.service';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  crear = false;
  insumos: InsumoMedicoModelo[] = [];
  medicamentos: MedicamentoModelo[] = [];
  stockForm: FormGroup;
  listaUnidadMedida: ParametroModelo;
  cargando = false;
  alert:boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  dtOptionsInsumos: any = {};
  dtOptionsMedicamentos: any = {};
  buscadorInsumoForm: FormGroup;
  buscadorMedicamentoForm: FormGroup;
  stock: StockModelo = new StockModelo();
  alertMedicamento:boolean=false;
  loadBuscadorInsumo = false;
  loadBuscadorMedicamento = false;

  constructor( private tokenService: TokenService,
               private stocksService: StocksService,
               private medicamentosService: MedicamentosService,
               private insumosMedicosService: InsumosMedicosService,
               private comunes: ComunesService,
               private route: ActivatedRoute,
               private router: Router,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private modalService: NgbModal ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if ( id !== 'nuevo' ) {
      this.deshabilitar();
      this.stocksService.getStock( Number(id) )
        .subscribe( (resp: StockModelo) => {
          this.stockForm.patchValue(resp);
        });
    }else{
      this.crear = true;
    }
  } 
  
  obtenerInsumo(event) {
    event.preventDefault();
    var id = this.stockForm.get('insumosMedicos').get('insumoMedicoId').value;
    if(!id){
      return null;
    }
    this.insumosMedicosService.getInsumo( id )
    .subscribe( (resp: InsumoMedicoModelo) => {
        this.stockForm.reset();
        this.stockForm.get('insumosMedicos').patchValue(resp);
        this.buscadorStock('isumo médico');
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e),
          })
          this.stockForm.get('insumosMedicos').get('insumoMedicoId').setValue(null);
        }
      );
  }

  obtenerMedicamento(event) {
    event.preventDefault();
    var id = this.stockForm.get('medicamentos').get('medicamentoId').value;
    if(!id){
      return null;
    }
    this.medicamentosService.getMedicamento( id )
    .subscribe( (resp: MedicamentoModelo) => {
        this.stockForm.reset();
        this.stockForm.get('medicamentos').patchValue(resp);
        this.buscadorStock('medicamento');
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e),
          })
          this.stockForm.get('medicamentos').get('medicamentoId').setValue(null);
        }
      );
  }


  selectInsumo(event, insumo: InsumoMedicoModelo){
    this.modalService.dismissAll();
    
    this.insumosMedicosService.getInsumo( insumo.insumoMedicoId )
      .subscribe( (resp: InsumoMedicoModelo) => {
        this.stockForm.reset();
        this.stockForm.get('insumosMedicos').patchValue(resp);
        this.buscadorStock('insumo médico');
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.stockForm.get('insumosMedicos').get('insumoMedicoId').setValue(null);
        }
      );
  }

  selectMedicamento(event, medicamento: MedicamentoModelo){
    this.modalService.dismissAll();

    this.medicamentosService.getMedicamento( medicamento.medicamentoId )
      .subscribe( (resp: MedicamentoModelo) => {
        this.stockForm.reset();
        this.stockForm.get('medicamentos').patchValue(resp);
        this.buscadorStock('medicamento');
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.stockForm.get('medicamentos').get('medicamentoId').setValue(null);
        }
      );
  }

  guardar( ) {

    if ( this.stockForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.stockForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    this.stock = this.stockForm.getRawValue();

    var cantidadModificar = ((document.getElementById("cantidadModificar") as HTMLInputElement).value);

    if( !cantidadModificar ){
      this.alertGuardar = true;
      return;
    }

    this.stock.cantidad = Number(cantidadModificar);

    if(!this.stock.insumosMedicos.insumoMedicoId && !this.stock.medicamentos.medicamentoId ){
      Swal.fire({
        icon: 'info',
        text: 'Debe ingresar un insumo o un medicamento'
      })
      return;
    }
    
    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peticion: Observable<any>;

    if ( this.stock.stockId ) {
      //Modificar
      this.stock.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.stocksService.actualizarStock( this.stock );
    } else {
      //Agregar
      this.stock.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.stocksService.crearStock( this.stock );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: resp.stock.stockId.toString(),
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.stock.stockId ) {
            this.router.navigate(['/stocks']);
          }else{
            this.limpiar(event);
          }
        }

      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e),
            })
       }
    );
  }

  limpiar(event){
    event.preventDefault();
    this.stock = new StockModelo();
    this.stockForm.reset();
    this.stockForm.get('insumosMedicos').get('insumoMedicoId').setValue(null);
    this.stockForm.get('medicamentos').get('medicamentoId').setValue(null);
    (document.getElementById("cantidadModificar") as HTMLInputElement).value = null;
  }

  limpiarModalMedicamento(event) {
    event.preventDefault();
    this.buscadorMedicamentoForm.reset();
    this.medicamentos = [];
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

    this.stockForm = this.fb.group({
      stockId  : [null, [] ],
      insumosMedicos : this.fb.group({
        insumoMedicoId  : [null ],
        codigo  : [null, [] ],
        nombre  : [null, [] ],
        presentacion  : [null, [] ],
        unidadMedida  : [null, [] ],
      }),
      medicamentos : this.fb.group({
        medicamentoId  : [null ],
        codigo  : [null, [] ],
        medicamento  : [null, [] ],
        forma : [null, [] ],
        presentacion  : [null, [] ],
        concentracion  : [null, [] ]
      }),
      cantidad  : [null, [ ] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ]  
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

    this.stockForm.get('stockId').disable();
   
    this.stockForm.get('fechaCreacion').disable();
    this.stockForm.get('fechaModificacion').disable();
    this.stockForm.get('usuarioCreacion').disable();
    this.stockForm.get('usuarioModificacion').disable();
  }
 
  deshabilitar(){
    this.stockForm.get('medicamentos').get('medicamentoId').disable();
    this.stockForm.get('insumosMedicos').get('insumoMedicoId').disable();
    //this.stockForm.get('cantidad').disable();

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
    this.insumosMedicosService.buscarInsumosMedicosFiltrosTabla(buscador)
    .subscribe( ( resp : InsumoMedicoModelo[] ) => {
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
    .subscribe( ( resp : MedicamentoModelo[] ) => {
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

  limpiarModal(event) {
    event.preventDefault();
    this.buscadorInsumoForm.reset();
    this.insumos = [];
  }

  cerrarAlert(){
    this.alert=false;
  }

  crearTablaModel(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
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
      searching: false,
      processing: true,
      columns: [ { data: 'insumoId' }, { data: 'codigo' }, 
      { data: 'descripcion' }, { data: 'tipo' }]      
    };
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

  buscadorStock(info) {
   
    var buscador: StockModelo = new StockModelo();
    var insumos = new InsumoMedicoModelo();
    var medicamentos = new MedicamentoModelo();

    insumos.insumoMedicoId = this.stockForm.get('insumosMedicos').get('insumoMedicoId').value;

    medicamentos.medicamentoId = this.stockForm.get('medicamentos').get('medicamentoId').value;

    buscador.insumosMedicos = insumos;
    buscador.medicamentos = medicamentos;

    if(!buscador.insumosMedicos.insumoMedicoId){
      buscador.insumosMedicos = null;
    } 

    if(!buscador.medicamentos.medicamentoId){
      buscador.medicamentos = null;
    } 
    this.stocksService.buscarStocksFiltrosTabla(buscador)
    .subscribe( ( resp : StockModelo[] ) => {      
      if( resp.length > 0){
        Swal.fire({
          icon: 'info',
          text: 'El ' + info + ' ya existe en el stock'
        })
      }
    });
  }

  onSubmit() {
    this.modalService.dismissAll();
  }
  
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }

  cerrarAlertMedicamento(){
    this.alertMedicamento=false;
  }
}

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"br/com/idxtecSafra/service/Session"
], function(Controller, MessageBox, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecSafra.controller.Safra", {
		onInit: function(){
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		onRefresh: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			oModel.refresh(true);
		},
		
		onIncluir: function(){
			var oDialog = this._criarDialog();
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			oViewModel.setData({
				titulo: "Inserir Safra",
				msgSave: "Safra inserida com sucesso!"
			});
			
			oDialog.unbindElement();
			oDialog.setEscapeHandler(function(oPromise){
				if(oModel.hasPendingChanges()){
					oModel.resetChanges();
				}
			});
			
			var oContext = oModel.createEntry("/Safras", {
				properties:{
					"Id": 0,
					"Descricao": "",
					"Inativa": false,
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				}
			});
			
			oDialog.setBindingContext(oContext);
			oDialog.open();
		},
		
		onEditar: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableSafra");
			var nIndex = oTable.getSelectedIndex();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			oViewModel.setData({
				titulo: "Editar Safra",
				msgSave: "Safra alterada com sucesso!"
			});
			
			if(nIndex === -1){
				MessageBox.information("Selecione uma safra da tabela!");
				return;
			}
			
			var oContext = oTable.getContextByIndex(nIndex);
			
			oDialog.bindElement(oContext.sPath);
			oDialog.open();
		},
		
		onRemover: function(){
			var that = this;
			var oTable = this.byId("tableSafra");
			var nIndex = oTable.getSelectedIndex();
			
			if(nIndex === -1){
				MessageBox.information("Selecione uma safra da tabela!");
				return;
			}
			
			MessageBox.confirm("Deseja remover essa safra?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						MessageBox.success("Safra removida com sucesso!");
						that._remover(oTable, nIndex);
					} 
				}      
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath,{
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_criarDialog: function(){
			var oView = this.getView();
			var oDialog = this.byId("SafraDialog"); 
			
			if(!oDialog){
				oDialog = sap.ui.xmlfragment(oView.getId(), "br.com.idxtecSafra.view.SafraDialog", this);
				oView.addDependent(oDialog);
			}
			
			return oDialog;
		},
		
		onSaveDialog: function(){
			var oView = this.getView();
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			if(this._checarCampos(this.getView()) === true){
				MessageBox.information("Preencha todos os campos obrigatórios!");
				return; 
			}else{
				oModel.submitChanges({
					success: function(){
						oModel.refresh(true);
						MessageBox.success(oViewModel.getData().msgSave);
						oView.byId("SafraDialog").close();
						oView.byId("tableSafra").clearSelection();
					},
					error: function(oError){
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onCloseDialog: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			if(oModel.hasPendingChanges()){
				oModel.resetChanges();
			}
			
			this.byId("SafraDialog").close();
		},
		
		_checarCampos: function(oView){
			if(oView.byId("descricao").getValue() === ""){
				return true; 
			}else{
				return false; 
			}
		}
	});
});
module.exports=function Cart(initStudents){
    this.items=initStudents.items || {};
    this.totalQty=initStudents.totalQty || 0;

    this.add=function(item, id){
        var storedItem=this.items[id];
        if(!storedItem){
            storedItem=this.items[id]={item:item};
        }
    };
    
    this.removeItem=function(id){
        this.totalQty-=1; 
        delete this.items[id]; 
    };
    
    this.generateArray=function(){
        var arr =[];
        for (var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
};
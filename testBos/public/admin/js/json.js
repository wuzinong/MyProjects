// Mock.mock( template )
var template = {
    'name': '名字',

    'num': '003',
    'times': '4次',

    'price01': '2000',
    'price02': '200',
    'price03': '1000'
}
var data = Mock.mock(/\.json/,template);

$.ajax({
    url: 'hello.json',
    dataType: 'json'
}).done(function(data, status, jqXHR){
    console.log(JSON.stringify(data, null, 4));
});
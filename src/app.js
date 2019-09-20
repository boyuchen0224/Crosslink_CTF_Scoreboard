function get_info() {
    var xml = new XMLHttpRequest;
    xml.open("get", "./get_info");
    xml.onreadystatechange = function() {
        if (xml.readyState == 4 && xml.status == 200) {
            rank_sort(JSON.parse(xml.responseText));
        }
    }
    xml.send();
}

function rank_sort(obj) {
    obj.sort(function(a, b) {
        if (a.user_level_total == b.user_level_total)
            return b.block_num - a.block_num;
        return b.user_level_total - a.user_level_total;
    })
    rank_show(obj);
    console.log(obj);
}

function rank_show(obj) {
    for (var i = 0, rank = 1; i < obj.length; i++, rank++) {

        var th = document.createElement('th');
        var th_text = document.createTextNode(rank);
        th.appendChild(th_text);

        var td_add = document.createElement('td');
        var td_add_text = document.createTextNode(obj[i].user_add);
        td_add.appendChild(td_add_text);

        var td_lv = document.createElement('td');
        var td_lv_text = document.createTextNode(obj[i].user_level_total);
        td_lv.appendChild(td_lv_text);

        var td_date = document.createElement('td');
        var td_date_text = document.createTextNode(obj[i].block_num);
        td_date.appendChild(td_date_text);

        var tr = document.createElement('tr');
        tr.appendChild(th);
        tr.appendChild(td_add);
        tr.appendChild(td_lv);
        tr.appendChild(td_date);
        document.getElementById('tbody').appendChild(tr);

    }
}

get_info();
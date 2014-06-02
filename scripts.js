var gol_size = 3;
var gol_matrix = [];
var gol_running = false;

var gol_handle;

var c7_scale = [0, 2, 4, 5, 7, 9, 11, 12];
var synth_tab;

function init_scrollbar() {
        
    $(".scrollbutton").mousedown(function(e) {
        
        e.originalEvent.preventDefault();
        
        if (e.which==1) {
            $(".scrollbutton").data("dragged", true);
            $(".scrollbutton").data("first_y", $(".scrollbutton").position().top);
            $(".scrollbutton").data("first_mouse_y", e.pageY);
        }
        
    });
    
    $(document).mousemove(function(e) {
        
        //e.originalEvent.preventDefault();
        
        if($(".scrollbutton").data("dragged"))
        {
            var sb = $(".scrollbutton");
            var new_y = (e.pageY - sb.data("first_mouse_y")) + sb.data("first_y");
            
            if (new_y < $(".scrollbar").position().top) {
                new_y = $(".scrollbar").position().top;
            }
            else if (new_y > $(".scrollbar").position().top + $(".scrollbar").height()-40.0) {
                new_y = $(".scrollbar").position().top + $(".scrollbar").height()-40.0;
            }
            
            sb.css("top", new_y);
            
            rel_y = new_y - $(".scrollbar").position().top;
            
            var new_size = Math.floor(rel_y/($(".scrollbar").height()-40.0)*7.0 + 0.45) + 3;
            if (new_size != gol_size) {
                
                // To make up for rounding errors
                
                if (new_size < 3) {
                    new_size = 3;
                }
                if (new_size > 10) {
                    new_size = 10;
                }
                
                
            }
            $(".size_num").html(new_size);
        }
        
    });
    
    $(document).mouseup(function() {
        
        if ($(".scrollbutton").data("dragged"))
        {
            $(".scrollbutton").data("dragged", false)
        }
        else
        {
            return;
        }
        
        var new_size = parseFloat($(".size_num").html());
        gol_size = new_size;
        init_matrix();
        
    });
    
    scrollbar_resize();
        
}

function init_matrix() {
    
    var size = gol_size;
    
    if (size <= 0) {
        return;
    }
    
    box_template = '<div class="box" id={insert_id}></div>';
    
    // Calculate matrix side
        
    m_html = "";
    
    gol_matrix = [];
    
    for (var x = 0; x < size; ++x)
    {
        gol_matrix.push([]);
        
        for (var y = 0; y < size; ++y)
        {
            var id = "cell_" + x + "_" + y;
            
            gol_matrix[x].push(0);
            m_html += box_template.replace("{insert_id}", id);
            
        }
    }
    
    $(".matrix").html(m_html);
    
    for (var x = 0; x < size; ++x)
    {
        for (var y = 0; y < size; ++y)
        {
            var id = "cell_" + x + "_" + y;

            
            $("#" + id).data("x", x);
            $("#" + id).data("y", y);
            
            $("#" + id).on("click", function () {
                
                if (gol_running) {
                    return;
                }
                
                x_i = $('#'+this.id).data("x");
                y_i = $('#'+this.id).data("y");
                gol_matrix[x_i][y_i] = 1 - gol_matrix[x_i][y_i];
                
                if (gol_matrix[x_i][y_i] == 1) {
                    $('#'+this.id).css("background", "#ffffff");                  
                }
                else
                {
                    $('#'+this.id).css("background", "#444444");                  
                }
                
            });
            
            $("#" + id).on("dragover", function(e) {
                
                e.preventDefault();
                
            });
            
            $("#" + id).on("dragleave", function(e) {
                
                e.preventDefault();
                
            });
            
            $("#" + id).on("drop", function(e) {
                
                e.preventDefault();
                e.stopPropagation();
                
                var note = e.originalEvent.dataTransfer.getData("note");
                var full_s = $(this).data("full_size");
                var full_b = $(this).data("full_bord");
                                
                $(this).data("note", note);
                
                if (note == 0) {
                    
                    
                    $(this).css("border", "0px solid");
                    $(this).css("height", full_s);
                    $(this).css("width", full_s);
                    
                    
                }
                else
                {
                    $(this).css("border", "5px solid");                    
                    $(this).css("border-color", e.originalEvent.dataTransfer.getData("note_col"));                    
                    $(this).css("height", full_s-10);
                    $(this).css("width", full_s-10);
                }
                
            });
            
        }
    }
       
       
    matrix_resize(size);
}

function matrix_resize(size)
{
    win_w = $(document).width();
    win_h = $(document).height();
    
    mat_w = Math.min(win_h, win_w);
    mat_w *= 0.6;
    
    if (mat_w < 100) {
        mat_w = 100;
        // Anyway, we can't make it TOO small
    }
    
    $(".matrix").width(mat_w);
    $(".matrix").height(mat_w);
    $(".matrix").css("top", win_h/2.0-mat_w/2.0);
    $(".matrix").css("left", win_w/2.0-mat_w/2.0);
    $(".matrix").css("border-radius", mat_w*0.05);
    
    var bord_w = (mat_w * 0.2)/(size+2.0);
    var cell_s = (mat_w*0.8)/(size);
    
    $(".box").css("margin", bord_w);
    $(".box").css("height", cell_s);
    $(".box").css("width", cell_s).hide();
    $(".box").css("border-radius", bord_w/2.0);
    $(".box").data("full_bord", bord_w);
    $(".box").data("full_size", cell_s);
    
    for (var x = 0; x < size; ++x)
    {
        for (var y = 0; y < size; ++y)
        {
            var id = "cell_" + x + "_" + y;
            
            $("#" + id).show().animate({
                top: bord_w/2.0 + (cell_s+bord_w)*y,
                left: bord_w/2.0 + (cell_s+bord_w)*x,
            });
            
        }
    }

}

function scrollbar_resize()
{

    win_w = $(document).width();
    win_h = $(document).height();
    
    var bar_h = win_h*0.7;
    
    $(".scrollbar").height(bar_h);
    
    $(".scrollbar").css("top", win_h/2.0-bar_h/2.0);
    $(".scrollbar").css("left", win_w*0.05);
    $(".scrollbutton").css("top", win_h/2.0-bar_h/2.0);
    $(".scrollbutton").css("left", win_w*0.05);
    
    $(".scrollbutton").data("dragged", false);
    $(".scrollbutton").data("last_mouse_y", NaN);
    
    $(".size_num").width(bar_h/5.0);
    $(".size_num").height(bar_h/5.0);
    $(".size_num").css("font-size", bar_h/6.0);
    $(".size_num").css("top", win_h/2.0-bar_h/10.0);
    $(".size_num").css("left", win_w*0.1);
}

function title_resize() {
    
    win_w = $(document).width();
    win_h = $(document).height();
    
    $(".titlediv").width(win_w*0.5);
    $(".titlediv").css("font-size", win_h*0.08);
    $(".titlediv").css("left", win_w/2.0-$(".titlediv").width()/2.0);
    $(".titlediv").css("top", win_h*0.05);
}

function button_resize() {
    
    win_w = $(document).width();
    win_h = $(document).height();
    
    $(".startbutton").width(win_w*0.13);
    $(".startbutton").height(win_h*0.08);
    $(".startbutton").css("line-height", win_h*0.09 + "px");
    $(".startbutton").css("font-size", win_h*0.06);
    
    $(".startbutton").css("top", win_h*0.52);
    $(".startbutton").css("left", win_w*0.8);

    $(".clearbutton").width(win_w*0.13);
    $(".clearbutton").height(win_h*0.08);
    $(".clearbutton").css("line-height", win_h*0.09 + "px");
    $(".clearbutton").css("font-size", win_h*0.06);
    
    $(".clearbutton").css("top", win_h*0.40);
    $(".clearbutton").css("left", win_w*0.8);
    
}

function start_gol()
{
    if (!gol_running) {
        gol_running = true;
        gol_handle = setInterval(update_gol, 1000.0);
    
        $(".startbutton").html("STOP");
    }
    else
    {
        gol_running = false;
        clearInterval(gol_handle);
    
        $(".startbutton").html("START");
    }    
}

function stop_gol()
{
}

function update_gol()
{
    var size = gol_size;
    
    var new_gol_matrix = []
    
    for (var x = 0; x < size; ++x)
    {
        new_gol_matrix.push([]);
        
        for (var y = 0; y < size; ++y)
        {
            // Count neighbours
            
            var neigh_sum = 0;
            
            for (var dx = -1; dx < 2; ++dx) {
                for (var dy = -1; dy < 2; ++dy) {
                    
                    if (dx==0 && dy==0) {
                        continue;
                    }
                    
                    xn = x+dx;
                    xn = (xn>=size?xn-size:(xn<0?xn+size:xn));
                    yn = y+dy;
                    yn = (yn>=size?yn-size:(yn<0?yn+size:yn));
                    
                    neigh_sum += gol_matrix[xn][yn];

                    
                    
                }
            }
            
            if (gol_matrix[x][y] == 1) {
                
                // Kill it off if it's over/underpopulated
                
                if (neigh_sum < 2 || neigh_sum > 3) {
                    
                    new_gol_matrix[x].push(0);
                }
                else
                {
                    new_gol_matrix[x].push(1);
                }
                
            }
            else
            {
                if (neigh_sum == 3) {
                    
                    new_gol_matrix[x].push(1);
                }
                else
                {
                    new_gol_matrix[x].push(0);
                }
            }            
            
        }
    }
            
    for (var x = 0; x < size; ++x) {
        for (var y = 0; y < size; ++y) {
            
            var id = "cell_" + x + "_" + y;

            gol_matrix[x][y] = new_gol_matrix[x][y];
            
            if (gol_matrix[x][y] == 1) {
                $('#'+id).css("background", "#ffffff");
                if ($('#'+id).data("note") != 0) {
                    synth_tab.noteOn($('#'+id).data("note"), 100);
                }
            }
            else
            {
                $('#'+id).css("background", "#444444");
            }
        }
    }
    
}

function play_note(n)
{
    var note_el = $("#" + n.target.id);
    note_el.animate({
        height: "+=10",
        width: "+=10",
        top: "-=5",
        left: "-=5"}, 150, 'swing').animate({
        height: "-=10",
        width: "-=10",
        top: "+=5",
        left: "+=5"}, 90, 'swing');
    
    synth_tab.noteOn(note_el.data("note"), 100);
}

function notebar_resize()
{
    win_w = $(document).width();
    win_h = $(document).height();
    
    var bar_w = win_w * 0.7;
    var tot_notes = $(".notebar").find(".notebutton").length;
    
    var osc = T("sin");
    var env = T("perc", {a:50, r:1000.0});
    synth_tab = T("OscGen", {osc:osc, env:env, mul:0.15}).play();
    
    $(".notebar").css("left", win_w/2.0 - bar_w/2.0);
    $(".notebar").css("top", 0.85*win_h);
    
    $(".notebar").find(".notebutton").each(function (i, n) {
       
       if (i < tot_notes-1) {
                    
            var r = Math.floor(Math.exp(-2*i/(tot_notes-1.0))*230);
            var g = Math.floor(Math.sin(i*Math.PI/(tot_notes-1.0))*255);
            var b = Math.floor(Math.exp(-2*(tot_notes-1.0 - i)/(tot_notes-1.0))*230);
        
           $(n).css("left", (bar_w) * i/(tot_notes+1)).css("background", "rgb(" + r + "," + g + "," + b + ")").attr("id", "note_" + i).data("note", 69 + c7_scale[i%8] + Math.floor(i/8)*12);
           
           $(n).on("click", play_note);
           
           $(n).attr("draggable", true);
           $(n).css("-khtml-user-drag", "element");
           $(n).on("dragstart", function (e) {
            e.originalEvent.dataTransfer.setData("note", 69 + c7_scale[i%8] + Math.floor(i/8)*12);
            e.originalEvent.dataTransfer.setData("note_col", "rgb(" + r + "," + g + "," + b + ")");
           });
           
           
       }
       else
       {
            $(n).attr("draggable", true);
            $(n).css("left", (bar_w) * (i+1)/(tot_notes+1)).css("background", "#ffffff");
            $(n).on("dragstart", function (e) {
                e.originalEvent.dataTransfer.setData("note", 0);
                e.originalEvent.dataTransfer.setData("note_col", "#ffffff");
            });
       }
       
       
        
    });
}

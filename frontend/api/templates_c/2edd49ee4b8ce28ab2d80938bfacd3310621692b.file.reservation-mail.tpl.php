<?php /* Smarty version Smarty-3.1.21-dev, created on 2014-12-09 17:28:50
         compiled from "reservation-mail.tpl" */ ?>
<?php /*%%SmartyHeaderCode:12174137305487189cd72a75-13329796%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '2edd49ee4b8ce28ab2d80938bfacd3310621692b' => 
    array (
      0 => 'reservation-mail.tpl',
      1 => 1418142462,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '12174137305487189cd72a75-13329796',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.21-dev',
  'unifunc' => 'content_5487189cda1932_83399265',
  'variables' => 
  array (
    'reservation' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5487189cda1932_83399265')) {function content_5487189cda1932_83399265($_smarty_tpl) {?><h1>Reservatie Kampplaats</h1>

<p>
Er is een reservatie binnengekomen van <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_entity'];?>
 (<?php echo $_smarty_tpl->tpl_vars['reservation']->value['_name'];?>
) voor de verhuur van Kampplaats 't Stupke
voor de periode van <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_arrival'];?>
 tot <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_departure'];?>
 voor <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_nr_of_people'];?>
 personen.
</p>

<h3>Details</h3>
<ul>
    <li>Vereniging: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_entity'];?>
</li>
    <li>Aantal personen: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_nr_of_people'];?>
</li>
    <li>Naam: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_name'];?>
</li>
    <li>Adres: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_address'];?>
</li>
    <li>Email: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_email'];?>
</li>
    <li>Telefoon: <?php echo $_smarty_tpl->tpl_vars['reservation']->value['_phone'];?>
</li>
</ul>

<h3>Opmerkingen</h3>
<?php echo $_smarty_tpl->tpl_vars['reservation']->value['_remarks'];?>
<?php }} ?>
